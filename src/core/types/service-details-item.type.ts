export type DetailMediaItem = {
  url: string;
  name: string;
  size: number;
  storagePath: string;
  detail_id: string;
  created_at: string;
};

export type DetailServiceItem = {
  service_id: string;
  details: Record<string, any>;
  ref_price: number;
  multimedia: DetailMediaItem[];
};
