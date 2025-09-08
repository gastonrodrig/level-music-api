import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from '../../firebase/services';
import { FeaturedEvent } from '../schema/featured-event.schema';
import { Event } from 'src/modules/event/schema/event.schema';
import { FeaturedEventsMedia } from 'src/modules/uploads/schema/collection';
import { CreateFeaturedEventDto, UpdateFeaturedEventDto } from '../dto';
import { UploadResult } from 'src/core/interfaces';
import { errorCodes } from 'src/core/common';
import { parseServices, SF_FEATURED_EVENT, toObjectId } from 'src/core/utils';

@Injectable()
export class FeaturedEventService {
  constructor(
    @InjectModel(FeaturedEvent.name)
    private readonly featuredEventModel: Model<FeaturedEvent>,
    @InjectModel(FeaturedEventsMedia.name)
    private readonly featuredEventsMediaModel: Model<FeaturedEventsMedia>,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
    private readonly storageService: StorageService,
  ) {}

  async create(
    createFeaturedEventDto: CreateFeaturedEventDto,
    images: Express.Multer.File[] = [],
  ): Promise<FeaturedEvent> {
    try {
      // 1) Validar evento y duplicado
      const event = await this.eventModel.findById(createFeaturedEventDto.event_id);
      if (!event) throw new BadRequestException('Event not found');

      const exists = await this.featuredEventModel.exists({ event: createFeaturedEventDto.event_id });
      if (exists) {
        throw new HttpException(
          {
            code: errorCodes.FEATURED_EVENT_ALREADY_EXISTS,
            message: 'Este evento ya está destacado.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // separar: primer archivo = cover, resto = galería
      const [cover, ...gallery] = images;

      // 2) Subir cover
      const coverUp = (await this.storageService.uploadFile(
        'featured-events',
        cover,
        'covers',
      )) as UploadResult;

      // 3) Crear destacado
      const featuredEvent = await this.featuredEventModel.create({
        ...createFeaturedEventDto,
        event: toObjectId(createFeaturedEventDto.event_id),
        services: parseServices(createFeaturedEventDto.services),
        cover_image: coverUp.url,
      });

      // 4) Registrar cover en media
      await this.featuredEventsMediaModel.create({
        featured_event: featuredEvent._id,
        url: coverUp.url,
        name: coverUp.name,
        size: coverUp.size,
        storage_path: coverUp.storagePath,
        order: 0,
        is_cover: true,
      });

      // 5) Subir galería (si hay)
      if (gallery?.length) {
        const uploaded = (await this.storageService.uploadMultipleFiles(
          'featured-events',
          gallery,
          'gallery',
        )) as UploadResult[];

        let order = 1;
        const docs = uploaded.map((it) => ({
          featured_event: featuredEvent._id,
          url: it.url,
          name: it.name,
          size: it.size,
          storage_path: it.storagePath,
          order: order++,
          is_cover: false,
        }));

        await this.featuredEventsMediaModel.insertMany(docs);
      }

      return featuredEvent;
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        `Error creating featured event: ${err.message}`,
      );
    }
  }

  // EXISTENTE: lo dejo igual (ya compone images).
  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: any[] }> {
    try {
      const filter = search
        ? {
            $or: SF_FEATURED_EVENT.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.featuredEventModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(Math.max(0, offset))
          .limit(Math.max(1, Math.min(50, limit)))
          .exec(),
        this.featuredEventModel.countDocuments(filter).exec(),
      ]);

      const eventIds = items.map((event) => event._id);
      const media = await this.featuredEventsMediaModel
        .find({ featured_event: { $in: eventIds } })
        .exec();

      const itemsWithImages = items.map((event) => {
        const gallery = media
          .filter((m) => m.featured_event.toString() === event._id.toString())
          .map((m) => m.url)
          .filter((url) => url !== event.cover_image); // evitar duplicar cover

        return {
          ...event.toObject(),
          images: [event.cover_image, ...gallery],
        };
      });

      return { total, items: itemsWithImages };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error finding featured events with pagination: ${error.message}`,
      );
    }
  }

  // // NUEVO: por si quieres consumir explícitamente "with-images" desde otro endpoint.
  // async findAllPaginatedWithImages(
  //   limit = 5,
  //   offset = 0,
  //   search = '',
  //   sortField: string = 'created_at',
  //   sortOrder: 'asc' | 'desc' = 'asc',
  // ): Promise<{ total: number; items: any[] }> {
  //   // Aquí reuso la existente; si luego separas lógicas, este método queda independiente.
  //   return this.findAllPaginated(limit, offset, search, sortField, sortOrder);
  // }

  // // NUEVO: detalle sin componer images (útil para GET :id básico si lo necesitas)
  // async findOne(id: string) {
  //   const doc = await this.featuredEventModel.findById(id);
  //   if (!doc) throw new NotFoundException('Featured event not found');
  //   return doc;
  // }

  // // NUEVO: detalle con images
  // async findOneWithImages(featuredEventId: string) {
  //   try {
  //     const featuredEvent = await this.featuredEventModel.findById(featuredEventId);
  //     if (!featuredEvent) throw new NotFoundException('Featured event not found');

  //     const media = await this.featuredEventsMediaModel
  //       .find({ featured_event: featuredEvent._id })
  //       .exec();

  //     const gallery = media
  //       .map((m) => m.url)
  //       .filter((url) => url !== featuredEvent.cover_image);

  //     return {
  //       ...featuredEvent.toObject(),
  //       images: [featuredEvent.cover_image, ...gallery],
  //     };
  //   } catch (err: any) {
  //     if (err instanceof HttpException) throw err;
  //     throw new InternalServerErrorException(
  //       `Error finding featured event: ${err.message}`,
  //     );
  //   }
  // }

  async update(
    featuredEventId: string,
    dto: UpdateFeaturedEventDto,
    images: Express.Multer.File[] = [],
  ): Promise<FeaturedEvent> {
    try {
      // Validaciones
      if (dto.event_id) {
        const exists = await this.featuredEventModel.exists({
          event: dto.event_id,
          _id: { $ne: featuredEventId },
        });
        if (exists) {
          throw new HttpException(
            {
              code: errorCodes.FEATURED_EVENT_ALREADY_EXISTS,
              message: 'Este evento ya está destacado.',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const featuredEvent = await this.featuredEventModel.findById(featuredEventId);
      if (!featuredEvent) throw new NotFoundException('Featured event not found');

      const updatedFeaturedEvent: Partial<FeaturedEvent> = {
        title: dto.title,
        featured_description: dto.featured_description,
        services: parseServices(dto.services),
        updated_at: new Date(),
      };

      if (dto.event_id) {
        updatedFeaturedEvent.event = toObjectId(dto.event_id);
      }

      // Si llegan imágenes, REEMPLAZAR TODO (cover + galería)
      if (images?.length) {
        // Borrar media anterior (docs + archivos en storage)
        const prevMedia = await this.featuredEventsMediaModel.find({
          featured_event: featuredEvent._id,
        });

        await Promise.all(
          prevMedia.map(async (m) => {
            if (m.storage_path) {
              await this.storageService.deleteFile(m.storage_path);
            }
          }),
        );
        await this.featuredEventsMediaModel.deleteMany({
          featured_event: featuredEvent._id,
        });

        // Subir nuevas (1ra = cover, resto = galería con order 1..N)
        const [cover, ...gallery] = images;

        const coverUp = (await this.storageService.uploadFile(
          'featured-events',
          cover,
          'covers',
        )) as UploadResult;

        updatedFeaturedEvent.cover_image = coverUp.url;

        const docs: any[] = [
          {
            featured_event: featuredEvent._id,
            url: coverUp.url,
            name: coverUp.name,
            size: coverUp.size,
            storage_path: coverUp.storagePath,
            order: 0,
            is_cover: true,
          },
        ];

        if (gallery.length) {
          const uploaded = (await this.storageService.uploadMultipleFiles(
            'featured-events',
            gallery,
            'gallery',
          )) as UploadResult[];

          let order = 1;
          for (const it of uploaded) {
            docs.push({
              featured_event: featuredEvent._id,
              url: it.url,
              name: it.name,
              size: Number(it.size),
              storage_path: it.storagePath,
              order: order++,
              is_cover: false,
            });
          }
        }

        await this.featuredEventsMediaModel.insertMany(docs);
      }

      const updated = await this.featuredEventModel.findByIdAndUpdate(
        featuredEvent._id,
        updatedFeaturedEvent,
        { new: true },
      );

      return updated!;
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        `Error updating featured event: ${err.message}`,
      );
    }
  }

  async delete(featuredEventId: string): Promise<{ ok: true }> {
    try {
      const featuredEvent = await this.featuredEventModel.findById(featuredEventId);
      if (!featuredEvent) throw new NotFoundException('Featured event not found');

      const media = await this.featuredEventsMediaModel.find({
        featured_event: featuredEvent._id,
      });

      // Borrar archivos en Firebase Storage (si existen)
      await Promise.all(
        media.map(async (m) => {
          if (m.storage_path) {
            await this.storageService.deleteFile(m.storage_path);
          }
        }),
      );

      // Borrar documentos de media
      await this.featuredEventsMediaModel.deleteMany({
        featured_event: featuredEvent._id,
      });

      // Borrar el documento principal
      await this.featuredEventModel.deleteOne({
        _id: featuredEvent._id,
      });

      return { ok: true };
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        `Error deleting featured event: ${err.message}`,
      );
    }
  }

  // NUEVO: obtener todos los featured events sin paginación y componer imágenes
  async findAll(): Promise<any[]> {
    try {
      const items = await this.featuredEventModel.find().exec();
      if (!items.length) return [];

      const eventIds = items.map((event) => event._id);
      const media = await this.featuredEventsMediaModel
        .find({ featured_event: { $in: eventIds } })
        .exec();

      const itemsWithImages = items.map((event) => {
        // Encuentra la cover en media (por si el campo cover_image está vacío)
        const coverMedia = media.find(
          (m) =>
            m.featured_event.toString() === event._id.toString() &&
            m.is_cover
        );
        const coverUrl = event.cover_image || coverMedia?.url || null;

        const gallery = media
          .filter(
            (m) =>
              m.featured_event.toString() === event._id.toString() &&
              !m.is_cover
          )
          .map((m) => m.url);

        // Si hay cover, la pone primero
        const images = coverUrl ? [coverUrl, ...gallery] : gallery;

        return {
          ...event.toObject(),
          images,
        };
      });

      return itemsWithImages;
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Error finding all featured events: ${err.message}`,
      );
    }
  }
}
