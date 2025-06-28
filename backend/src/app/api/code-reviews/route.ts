import { NextRequest, NextResponse } from 'next/server';
import { CodeReviewService } from '@/services/codeReview.service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const data = await request.json();
    const review = await CodeReviewService.createReview(data, session.user.id);
    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating code review:', error);
    return NextResponse.json(
      { error: 'Failed to create code review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reviews = await CodeReviewService.getUserReviews(session.user.id);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching code reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch code reviews' },
      { status: 500 }
    );
  }
} 