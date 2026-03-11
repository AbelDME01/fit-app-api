import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class ExercisesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService.client
      .from('exercises')
      .select('*, workout_types(name, icon, color)')
      .order('name');

    if (error) {
      throw new Error('Error fetching exercises');
    }

    return data;
  }

  async findOne(id: number) {
    const { data, error } = await this.supabaseService.client
      .from('exercises')
      .select('*, workout_types(name, icon, color)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Exercise not found');
    }

    return data;
  }

  async search(query: string) {
    const { data, error } = await this.supabaseService.client
      .from('exercises')
      .select('*, workout_types(name, icon, color)')
      .ilike('name', `%${query}%`)
      .limit(20);

    if (error) {
      throw new Error('Error searching exercises');
    }

    return data;
  }
}
