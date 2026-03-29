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
      throw new Error('Error creating workout');
    }

    // Create workout exercises
    if (exercises?.length) {
      const workoutExercises = exercises.map((ex, index) => ({
        ...ex,
        workout_id: workout.id,
        order_index: index,
      }));

      const { error: exercisesError } = await this.supabaseService.client
        .from('workout_exercises')
        .insert(workoutExercises);

      if (exercisesError) {
        // Rollback: delete the workout
        await this.supabaseService.client.from('workouts').delete().eq('id', workout.id);
        throw new InternalServerErrorException('Error creating workout exercises');
      }
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
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    const [{ data: currentData, error: currentError }, { data: previousData, error: previousError }] =
      await Promise.all([
        this.supabaseService.client
          .from('workouts')
          .select('id, duration_minutes, completed_at')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', oneWeekAgo.toISOString()),
        this.supabaseService.client
          .from('workouts')
          .select('id, duration_minutes, completed_at')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', twoWeeksAgo.toISOString())
          .lt('completed_at', oneWeekAgo.toISOString()),
      ]);

    if (currentError) {
      return { totalSessions: 0, totalTime: 0, weeklyChange: 0, timeChange: 0 };
    }

    const totalSessions = currentData.length;
    const totalTime = currentData.reduce((acc, w) => acc + (w.duration_minutes || 0), 0) / 60;

    const previousSessions = previousError ? 0 : (previousData?.length ?? 0);
    const previousMinutes = previousError ? 0 : (previousData ?? []).reduce((acc, w) => acc + (w.duration_minutes || 0), 0);
    const currentMinutes = currentData.reduce((acc, w) => acc + (w.duration_minutes || 0), 0);

    return {
      totalSessions,
      totalTime: Math.round(totalTime * 10) / 10,
      weeklyChange: totalSessions - previousSessions,
      timeChange: Math.round(currentMinutes - previousMinutes),
    };
  }
}
