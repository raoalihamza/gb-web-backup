import React from 'react';
import Skeleton from 'react-loading-skeleton';
import SkeletonTheme from '../../../shared/components/Skeleton';

export const CategoryFormSkeleton = () => (
	<SkeletonTheme>
		<div className="text-center">
			<Skeleton className="dashboard-rectangle col-md-8" />
		</div>
		<Skeleton className="dashboard-rectangle my-4" />
	</SkeletonTheme>
);

export const ListSkeleton = () => (
	<SkeletonTheme>
		<Skeleton className="dashboard-rectangle-sm" />
	</SkeletonTheme>
);
