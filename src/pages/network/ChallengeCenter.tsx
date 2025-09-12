import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Target, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Star,
  Gift,
  Zap
} from 'lucide-react';
import { NetworkService, ChallengeWithParticipation } from '@/services/networkService';
import { useAppStore } from '@/context/AppStore';
import { toast } from 'sonner';

export default function ChallengeCenter() {
  const navigate = useNavigate();
  const { state } = useAppStore();
  
  const [challenges, setChallenges] = useState<ChallengeWithParticipation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.selectedClassroom?.id) {
      loadChallenges();
    }
  }, [state.selectedClassroom?.id]);

  const loadChallenges = async () => {
    if (!state.selectedClassroom?.id) return;
    
    setLoading(true);
    try {
      const activeChallenges = await NetworkService.getActiveChallenges(state.selectedClassroom.id);
      setChallenges(activeChallenges);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string, challengeName: string) => {
    if (!state.selectedClassroom?.id) return;
    
    try {
      await NetworkService.joinChallenge(state.selectedClassroom.id, challengeId);
      toast.success(`Joined ${challengeName}!`);
      loadChallenges(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to join challenge:', error);
      toast.error(error.message || 'Failed to join challenge');
    }
  };

  const handleLeaveChallenge = async (challengeId: string, challengeName: string) => {
    if (!state.selectedClassroom?.id) return;
    
    try {
      await NetworkService.leaveChallenge(state.selectedClassroom.id, challengeId);
      toast.success(`Left ${challengeName}`);
      loadChallenges(); // Refresh the list
    } catch (error) {
      console.error('Failed to leave challenge:', error);
      toast.error('Failed to leave challenge');
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'harvest': return <Trophy className="h-5 w-5 text-green-500" />;
      case 'growth': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'innovation': return <Zap className="h-5 w-5 text-yellow-500" />;
      default: return <Trophy className="h-5 w-5 text-gray-500" />;
    }
  };

  const getChallengeTypeText = (type: string) => {
    switch (type) {
      case 'harvest': return 'Harvest Challenge';
      case 'growth': return 'Growth Challenge';
      case 'innovation': return 'Innovation Challenge';
      default: return 'Challenge';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (challenge: ChallengeWithParticipation) => {
    const daysRemaining = getDaysRemaining(challenge.end_date);
    const totalDays = Math.ceil((new Date(challenge.end_date).getTime() - new Date(challenge.start_date).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));
  };

  if (!state.selectedClassroom) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Challenge Center</h1>
          <p className="text-muted-foreground">
            Browse and participate in network challenges.
          </p>
        </div>
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a Classroom</h3>
          <p className="text-muted-foreground mb-4">
            Please select a classroom to participate in challenges.
          </p>
          <Button onClick={() => navigate('/app/classrooms')}>
            Go to Classrooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Challenge Center</h1>
          <p className="text-muted-foreground">
            Browse and participate in network challenges.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/app/leaderboard')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            View Leaderboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/app/network')}>
            Back to Network
          </Button>
        </div>
      </div>

      {/* Challenge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{challenges.length}</div>
            <p className="text-xs text-muted-foreground">
              Available to join
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participating</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {challenges.filter(c => c.is_participating).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently competing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {challenges.reduce((sum, c) => sum + c.participation_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all challenges
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {loading ? 'Loading...' : `${challenges.length} Active Challenges`}
          </h2>
          {challenges.length > 0 && (
            <Button variant="outline" size="sm" onClick={loadChallenges}>
              Refresh Challenges
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : challenges.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
              <p className="text-muted-foreground mb-4">
                There are currently no active challenges. Check back later for new competitions!
              </p>
              <Button variant="outline" onClick={() => navigate('/app/network')}>
                Back to Network
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => {
              const daysRemaining = getDaysRemaining(challenge.end_date);
              const progressPercentage = getProgressPercentage(challenge);
              const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
              
              return (
                <Card key={challenge.id} className={`hover:shadow-md transition-shadow ${challenge.is_participating ? 'border-primary/20 bg-primary/5' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getChallengeIcon(challenge.challenge_type)}
                          <CardTitle className="text-xl">{challenge.title}</CardTitle>
                          {challenge.is_participating && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Participating
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base">
                          {challenge.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {getChallengeTypeText(challenge.challenge_type)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {challenge.participation_count} participants
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Challenge Details */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Start Date</div>
                          <div className="text-muted-foreground">
                            {new Date(challenge.start_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">End Date</div>
                          <div className="text-muted-foreground">
                            {new Date(challenge.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Goal</div>
                          <div className="text-muted-foreground">
                            {challenge.goal_description || 'Complete the challenge objectives'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {challenge.is_participating && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Challenge Progress</span>
                          <span className="text-muted-foreground">
                            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Challenge ended'}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    )}

                    {/* Rewards */}
                    {challenge.rewards && challenge.rewards.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Gift className="h-4 w-4 text-yellow-500" />
                          Rewards
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {challenge.rewards.map((reward, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              {reward}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expiring Soon Alert */}
                    {isExpiringSoon && !challenge.is_participating && (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          This challenge ends in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}! Join now to participate.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {challenge.is_participating ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/app/network/challenge/${challenge.id}`)}
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            View Progress
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleLeaveChallenge(challenge.id, challenge.title)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Leave Challenge
                          </Button>
                        </>
                      ) : daysRemaining > 0 ? (
                        <Button 
                          size="sm"
                          onClick={() => handleJoinChallenge(challenge.id, challenge.title)}
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          Join Challenge
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <Clock className="h-3 w-3 mr-1" />
                          Challenge Ended
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Getting Started Tips */}
      {challenges.length > 0 && challenges.filter(c => c.is_participating).length === 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Ready to Compete?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Join challenges to compete with other classrooms and showcase your growing success!
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium">1. Choose Your Challenge</div>
                <div className="text-muted-foreground">Select a challenge that matches your classroom's goals</div>
              </div>
              <div>
                <div className="font-medium">2. Track Your Progress</div>
                <div className="text-muted-foreground">Monitor your performance against other participants</div>
              </div>
              <div>
                <div className="font-medium">3. Earn Rewards</div>
                <div className="text-muted-foreground">Win prizes and recognition for your achievements</div>
              </div>
              <div>
                <div className="font-medium">4. Build Connections</div>
                <div className="text-muted-foreground">Connect with other competitive classrooms</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}