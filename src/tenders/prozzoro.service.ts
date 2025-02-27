import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProzorroService {
  constructor(private readonly httpService: HttpService) {}

  async getTenderIdsFrom(offset: string, limit: number = undefined) {
    for (let i = 0; i < 100; i++) {
      try {
        return (await firstValueFrom(this.httpService.get('/tenders', { params: { offset, limit } }))).data;
      } catch {}
    }
  }

  async getTenderById(id: string) {
    for (let i = 0; i < 100; i++) {
      try {
        return (await firstValueFrom(this.httpService.get('/tenders/' + id))).data.data;
      } catch {}
    }
  }
}
