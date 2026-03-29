import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class ProgressService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getSummary(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await this.supabaseService.client
      .from('workouts')
      .select('id, duration_minutes, completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', thirtyDaysAgo.toISOString());

    if (error) {
      return { totalWorkouts: 0, totalTime: 0, averagePerWeek: 0 };
    }

    const totalWorkouts = data.length;
    const totalTime = data.reduce((acc, w) => acc + (w.duration_minutes || 0), 0) / 60;
    const averagePerWeek = Math.round((totalWorkouts / 4) * 10) / 10;

    return {
      totalWorkouts,
      totalTime: Math.round(totalTime * 10) / 10,
      averagePerWeek,
    };
  }

  async getWeeklyProgress(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await this.supabaseService.client
      .from('workouts')
      .select('completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', sevenDaysAgo.toISOString());

    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const counts = new Array(7).fill(0);

    data?.forEach((workout) => {
      const dayIndex = new Date(workout.completed_at).getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      counts[adjustedIndex]++;
    });

    return { labels: days, data: counts };
  }

  async getMonthlyProgress(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await this.supabaseService.client
      .from('workouts')
      .select('completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', thirtyDaysAgo.toISOString());

    // Group by week
    const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    const counts = new Array(4).fill(0);

    data?.forEach((workout) => {
      const daysDiff = Math.floor(
        (new Date().getTime() - new Date(workout.completed_at).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const weekIndex = Math.min(Math.floor(daysDiff / 7), 3);
      counts[3 - weekIndex]++;
    });

    return { labels: weeks, data: counts };
  }

  async getYearlyProgress(userId: string) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data } = await this.supabaseService.client
      .from('workouts')
      .select('completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', oneYearAgo.toISOString());

    const months = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const counts = new Array(12).fill(0);

    data?.forEach((workout) => {
      const monthIndex = new Date(workout.completed_at).getMonth();
      counts[monthIndex]++;
    });

    return { labels: months, data: counts };
  }

  async getGoals(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data;
  }

  async createGoal(userId: string, createGoalDto: CreateGoalDto) {
    const { data, error } = await this.supabaseService.client
      .from('goals')
      .insert({
        user_id: userId,
        ...createGoalDto,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException('Error creating goal');
    }

    return data;
  }

  async updateGoal(userId: string, id: string, updateGoalDto: UpdateGoalDto) {
    const { data, error } = await this.supabaseService.client
      .from('goals')
      .update(updateGoalDto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Goal not found');
    }

    return data;
  }
}
