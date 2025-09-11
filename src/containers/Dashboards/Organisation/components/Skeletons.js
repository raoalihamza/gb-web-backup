import React from 'react';
import Skeleton from 'react-loading-skeleton';
import SkeletonTheme from '../../../../shared/components/Skeleton';

export const DashboardSkeleton = () => (
	<SkeletonTheme>
		<div>
			<div className="dashboard-skeleton-grid">
				<Skeleton className="dashboard-rectangle" />
				<Skeleton className="dashboard-rectangle" />
			</div>
			<div className="dashboard-skeleton-grid mt-4">
				<Skeleton className="dashboard-rectangle-sm" />
				<Skeleton className="dashboard-rectangle-sm" />
			</div>{' '}
			<Skeleton className="dashboard-rectangle mt-4" />
			<div className="dashboard-skeleton-grid mt-4">
				<Skeleton className="dashboard-rectangle-sm" />
				<Skeleton className="dashboard-rectangle-sm" />
			</div>
			<Skeleton className="dashboard-rectangle mt-4" />
			<div className="dashboard-skeleton-grid mt-4">
				<Skeleton className="dashboard-rectangle-sm" />
				<Skeleton className="dashboard-rectangle-sm" />
			</div>
		</div>
	</SkeletonTheme>
);

export const ChallengePreviewSkeleton = () => (
	<SkeletonTheme>
		<div>
			<Skeleton className="dashboard-rectangle-challenge-preview" />
		</div>
	</SkeletonTheme>
);

export const ListSkeleton = () => (
	<SkeletonTheme>
		<Skeleton className="dashboard-rectangle-sm" />
	</SkeletonTheme>
);
