import React from 'react';
import Skeleton from 'react-loading-skeleton';
import SkeletonTheme from '../../../../shared/components/Skeleton';

export const PreviewsSkeleton = () => (
	<SkeletonTheme>
		<Skeleton className="dashboard-rectangle-sm" />
	</SkeletonTheme>
);

export const InfoPageSkeleton = () => (
	<SkeletonTheme>
		<Skeleton className="dashboard-rectangle-sm" />
		<div className="dashboard-skeleton-grid mt-4">
			<Skeleton className="dashboard-rectangle-sm" />
			<Skeleton className="dashboard-rectangle-sm" />
		</div>
		<Skeleton className="dashboard-rectangle my-4" />
	</SkeletonTheme>
);

export const FormSkeleton = () => (
	<SkeletonTheme>
		<Skeleton className="dashboard-rectangle-xl" />
	</SkeletonTheme>
);
