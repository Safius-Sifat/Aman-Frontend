import { json } from '@sveltejs/kit';
import { getConnectionGraph } from '$lib/services/database.js';

export async function GET({ url, locals }) {
  try {
    // Get user ID from session/auth
    const userId = locals.user?.id;
    
    if (!userId) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get query parameters
    const minScore = parseInt(url.searchParams.get('minScore') || '50');
    const maxDepth = parseInt(url.searchParams.get('maxDepth') || '3');
    
    // Get connection graph data
    const connectionData = await getConnectionGraph(userId, {
      minScore,
      maxDepth
    });
    
    // Format for D3.js visualization
    const nodes = connectionData.users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      type: user.id === userId ? 'self' : 'potential',
      location: user.lastKnownLocation || 'Unknown',
      group: user.id === userId ? 1 : 2
    }));
    
    const links = connectionData.connections.map(conn => ({
      source: conn.user1Id,
      target: conn.user2Id,
      score: conn.score,
      facialScore: conn.facialScore,
      voiceScore: conn.voiceScore,
      infoScore: conn.infoScore,
      strength: conn.score >= 80 ? 'strong' : conn.score >= 60 ? 'medium' : 'weak'
    }));
    
    return json({
      success: true,
      connections: {
        nodes,
        links
      },
      metadata: {
        totalNodes: nodes.length,
        totalConnections: links.length,
        centerNode: userId
      }
    });
    
  } catch (error) {
    console.error('Connections error:', error);
    return json(
      { error: 'Failed to load connections' },
      { status: 500 }
    );
  }
}
