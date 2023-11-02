export interface Model {
  findByPk<T = any>(id: number): Promise<T | null>
  findOne<T = any>(condition: Record<string, any>): Promise<T | null>
  updateByPk?<T = any>(id: number, data: Record<string, any>): Promise<T>
  updateOne?<T = any>(data: Record<string, any>): Promise<T | null>
  create?<T = any, R = any>(data: T): Promise<R>
}
