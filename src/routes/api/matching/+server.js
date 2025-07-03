import { json } from '@sveltejs/kit';
import { findPotentialMatches } from '$lib/services/database.js';
import { calculateSimilarity } from '$lib/services/biometrics.js';

export async function GET({ url, locals }) {
  try {
    // Get user ID from session/auth
    const userId = locals.user?.id;
    
    if (!userId) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get query parameters
    const minScore = parseInt(url.searchParams.get('minScore') || '50');
    const maxResults = parseInt(url.searchParams.get('maxResults') || '20');
    
    // Find potential matches
    const potentialMatches = await findPotentialMatches(userId, {
      minScore,
      maxResults
    });
    
    // Calculate detailed similarity scores
    const matches = await Promise.all(
      potentialMatches.map(async (match) => {
        const similarity = await calculateSimilarity(userId, match.id);
        
        return {
          id: match.id,
          name: `${match.firstName} ${match.lastName}`,
          relationship: match.predictedRelationship || 'Unknown',
          location: match.lastKnownLocation || 'Unknown',
          score: Math.round(similarity.overall * 100),
          facialScore: Math.round(similarity.facial * 100),
          voiceScore: Math.round(similarity.voice * 100),
          infoScore: Math.round(similarity.information * 100),
          confidence: similarity.confidence,
          lastSeen: match.separationDate || match.registrationDate
        };
      })
    );
    
    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);
    
    return json({
      success: true,
      matches,
      totalCount: matches.length
    });
    
  } catch (error) {
    console.error('Matching error:', error);
    return json(
      { error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}
