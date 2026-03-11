import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateRecordDto } from './dto/create-record.dto';

@Injectable()
export class RecordsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(userId: string, type?: string) {
    let query = this.supabaseService.client
      .from('personal_records')
      .select(`
        *,
        exercises (name, muscle_group, workout_type_id)
      `)
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    // Filter by workout type if specified
    if (type && type !== 'all') {
      const typeId = type === 'strength' ? 1 : 2;
      query = query.eq('exercises.workout_type_id', typeId);
    }

    const { data, error } = await query;

    if (error) {
      return [];
    }

    // Transform data to include exercise name
    return data.map((record) => ({
      ...record,
      exerciseName: record.exercises?.name,
      muscleGroup: record.exercises?.muscle_group,
    }));
  }

  async findByExercise(userId: string, exerciseId: number) {
    const { data, error } = await this.supabaseService.client
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .order('achieved_at', { ascending: false })
      .limit(1);

    if (error || !data.length) {
      return null;
    }

    return data[0];
  }

  async getHistory(userId: string, exerciseId: number) {
    const { data, error } = await this.supabaseService.client
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .order('achieved_at', { ascending: false });

    if (error) {
      return [];
    }

    return data;
  }

  async create(userId: string, createRecordDto: CreateRecordDto) {
    // Get previous record for this exercise
    const previousRecord = await this.findByExercise(userId, createRecordDto.exercise_id);

    const { data, error } = await this.supabaseService.client
      .from('personal_records')
      .insert({
        user_id: userId,
        ...createRecordDto,
        previous_value: previousRecord?.value || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error creating record');
    }

    return data;
  }
}
