import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(userId: string, limit?: number) {
    let query = this.supabaseService.client
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercises (name, muscle_group)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new NotFoundException('Error fetching workouts');
    }

    return data;
  }

  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabaseService.client
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercises (name, muscle_group)
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Workout not found');
    }

    return data;
  }

  async create(userId: string, createWorkoutDto: CreateWorkoutDto) {
    const { exercises, ...workoutData } = createWorkoutDto;

    // Create workout
    const { data: workout, error: workoutError } = await this.supabaseService.client
      .from('workouts')
      .insert({
        ...workoutData,
        user_id: userId,
      })
      .select()
      .single();

    if (workoutError) {
      throw new InternalServerErrorException('Error creating workout');
    }

    // Create workout exercises
    if (exercises?.length) {
      const workoutExercises = exercises.map((ex, index) => ({
        ...ex,
        workout_id: workout.id,
        order_index: index,
      }));

      await this.supabaseService.client
        .from('workout_exercises')
        .insert(workoutExercises);
    }

    return this.findOne(userId, workout.id);
  }

  async update(userId: string, id: string, updateWorkoutDto: UpdateWorkoutDto) {
    const { exercises, ...workoutData } = updateWorkoutDto;

    const { data, error } = await this.supabaseService.client
      .from('workouts')
      .update({
        ...workoutData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Workout not found');
    }

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const { error } = await this.supabaseService.client
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new NotFoundException('Workout not found');
    }

    return { message: 'Workout deleted successfully' };
  }

  async complete(userId: string, id: string, durationMinutes: number) {
    const { data, error } = await this.supabaseService.client
      .from('workouts')
      .update({
        completed_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Workout not found');
    }

    return data;
  }

  async getWeeklyStats(userId: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data, error } = await this.supabaseService.client
      .from('workouts')
      .select('id, duration_minutes, completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', oneWeekAgo.toISOString());

    if (error) {
      return { totalSessions: 0, totalTime: 0, weeklyChange: 0, timeChange: 0 };
    }

    const totalSessions = data.length;
    const totalTime = data.reduce((acc, w) => acc + (w.duration_minutes || 0), 0) / 60;

    return {
      totalSessions,
      totalTime: Math.round(totalTime * 10) / 10,
      weeklyChange: 2, // TODO: Calculate from previous week
      timeChange: 45, // TODO: Calculate from previous week
    };
  }
}
