import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock, 
  Send, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  MapPin,
  GraduationCap,
  School,
  Trash2,
  Ban
} from 'lucide-react';
import { NetworkService, ConnectionWithDetails } from '@/services/networkService';
import { useAppStore } from '@/context/AppStore';
import { toast } from 'sonner';

export default function MyConnections() {
  const navigate = useNavigate();
  const { state } = useAppStore();
  
  const [connections, setConnections] = useState<ConnectionWithDetails[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{
    incoming: ConnectionWithDetails[];
    outgoing: ConnectionWithDetails[];
  }>({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.selectedClassroom?.id) {
      loadConnections();
    }
  }, [state.selectedClassroom?.id]);

  const loadConnections = async () => {
    if (!state.selectedClassroom?.id) return;
    
    setLoading(true);
    try {
      const [connectionsData, pendingData] = await Promise.all([
        NetworkService.getMyConnections(state.selectedClassroom.id),
        NetworkService.getPendingRequests(state.selectedClassroom.id)
      ]);
      
      setConnections(connectionsData);
      setPendingRequests(pendingData);
    } catch (error) {
      console.error('Failed to load connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (connectionId: string, status: 'accepted' | 'declined', classroomName: string) => {
    try {
      await NetworkService.respondToConnectionRequest(connectionId, status);
      toast.success(`Connection request ${status} with ${classroomName}`);
      loadConnections(); // Refresh the data
    } catch (error) {
      console.error('Failed to respond to connection request:', error);
      toast.error('Failed to respond to connection request');
    }
  };

  const handleRemoveConnection = async (connectionId: string, classroomName: string) => {
    try {
      await NetworkService.removeConnection(connectionId);
      toast.success(`Connection with ${classroomName} removed`);
      loadConnections(); // Refresh the data
    } catch (error) {
      console.error('Failed to remove connection:', error);
      toast.error('Failed to remove connection');
    }
  };

  const handleBlockClassroom = async (connectionId: string, classroomName: string) => {
    try {
      await NetworkService.blockClassroom(connectionId);
      toast.success(`${classroomName} has been blocked`);
      loadConnections(); // Refresh the data
    } catch (error) {
      console.error('Failed to block classroom:', error);
      toast.error('Failed to block classroom');
    }
  };

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'competition': return <Users className="h-4 w-4 text-red-500" />;
      case 'collaboration': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'mentorship': return <UserCheck className="h-4 w-4 text-green-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionTypeText = (type: string) => {
    switch (type) {
      case 'competition': return 'Competition';
      case 'collaboration': return 'Collaboration';
      case 'mentorship': return 'Mentorship';
      default: return 'Connection';
    }
  };

  const getOtherClassroom = (connection: ConnectionWithDetails) => {
    const isRequester = connection.requester_classroom_id === state.selectedClassroom?.id;
    return isRequester ? connection.target_classroom : connection.requester_classroom;
  };

  if (!state.selectedClassroom) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Connections</h1>
          <p className="text-muted-foreground">
            Manage your classroom connections and requests.
          </p>
        </div>
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a Classroom</h3>
          <p className="text-muted-foreground mb-4">
            Please select a classroom to manage connections.
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
          <h1 className="text-3xl font-bold">My Connections</h1>
          <p className="text-muted-foreground">
            Manage your classroom connections and requests.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/app/network/discover')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Find Classrooms
          </Button>
          <Button variant="outline" onClick={() => navigate('/app/network')}>
            Back to Network
          </Button>
        </div>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections">
            <Users className="h-4 w-4 mr-2" />
            Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="incoming">
            <Clock className="h-4 w-4 mr-2" />
            Incoming ({pendingRequests.incoming.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            <Send className="h-4 w-4 mr-2" />
            Outgoing ({pendingRequests.outgoing.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Connections */}
        <TabsContent value="connections" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : connections.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Connections</h3>
                <p className="text-muted-foreground mb-4">
                  Start connecting with other classrooms to build your network.
                </p>
                <Button onClick={() => navigate('/app/network/discover')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Discover Classrooms
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((connection) => {
                const otherClassroom = getOtherClassroom(connection);
                return (
                  <Card key={connection.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {otherClassroom?.display_name || otherClassroom?.classroom?.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {otherClassroom?.classroom?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getConnectionTypeIcon(connection.connection_type)}
                          <Badge variant="secondary" className="text-xs">
                            {getConnectionTypeText(connection.connection_type)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {otherClassroom?.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {otherClassroom.bio}
                        </p>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Connected {new Date(connection.accepted_at!).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/app/network/profile/${connection.target_classroom_id === state.selectedClassroom?.id ? connection.requester_classroom_id : connection.target_classroom_id}`)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRemoveConnection(connection.id, otherClassroom?.display_name || otherClassroom?.classroom?.name || 'this classroom')}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Incoming Requests */}
        <TabsContent value="incoming" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : pendingRequests.incoming.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">
                  You're all caught up! No incoming connection requests.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.incoming.map((request) => {
                const requesterClassroom = request.requester_classroom;
                return (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {requesterClassroom?.display_name || requesterClassroom?.classroom?.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {requesterClassroom?.classroom?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getConnectionTypeIcon(request.connection_type)}
                          <Badge variant="secondary" className="text-xs">
                            {getConnectionTypeText(request.connection_type)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {request.message && (
                        <Alert>
                          <MessageSquare className="h-4 w-4" />
                          <AlertDescription>
                            "{request.message}"
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {requesterClassroom?.bio && (
                        <p className="text-sm text-muted-foreground">
                          {requesterClassroom.bio}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Request sent {new Date(request.created_at).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleRespondToRequest(request.id, 'accepted', requesterClassroom?.display_name || requesterClassroom?.classroom?.name || 'this classroom')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRespondToRequest(request.id, 'declined', requesterClassroom?.display_name || requesterClassroom?.classroom?.name || 'this classroom')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleBlockClassroom(request.id, requesterClassroom?.display_name || requesterClassroom?.classroom?.name || 'this classroom')}
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          Block
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Outgoing Requests */}
        <TabsContent value="outgoing" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : pendingRequests.outgoing.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Send className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">
                  You haven't sent any connection requests yet.
                </p>
                <Button onClick={() => navigate('/app/network/discover')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Classrooms to Connect With
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.outgoing.map((request) => {
                const targetClassroom = request.target_classroom;
                return (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {targetClassroom?.display_name || targetClassroom?.classroom?.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {targetClassroom?.classroom?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getConnectionTypeIcon(request.connection_type)}
                          <Badge variant="secondary" className="text-xs">
                            {getConnectionTypeText(request.connection_type)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {request.message && (
                        <Alert>
                          <MessageSquare className="h-4 w-4" />
                          <AlertDescription>
                            "{request.message}"
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Request sent {new Date(request.created_at).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/app/network/profile/${request.target_classroom_id}`)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRemoveConnection(request.id, targetClassroom?.display_name || targetClassroom?.classroom?.name || 'this classroom')}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Cancel Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}