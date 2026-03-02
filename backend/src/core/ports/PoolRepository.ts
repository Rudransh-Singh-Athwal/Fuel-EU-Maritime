export interface PoolMemberData {
  ship_id: string;
  cb_before: number;
  cb_after: number;
}

export interface PoolRepository {
  createPool(year: number, members: PoolMemberData[]): Promise<void>;
}
