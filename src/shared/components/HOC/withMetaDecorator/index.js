import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

export default function withMetaDecorator(
	WrappedComponent, // Actually will be a page
	{ title = '', description = '' },
) {
	return (props) => {
		const [t] = useTranslation('common');
		const _title = t(title);
		const _description = t(description);

		return (
			<>
				<Helmet>
					<title>{_title}</title>
					<meta name="description" content={_description} />
					<meta property="og:title" content={_title} />
					<meta property="og:description" content={_description} />
					{/* TODO: Ask for og:image and revisit react-snap */}
					<meta
						property="og:image"
						content="http://euro-travel-example.com/thumbnail.jpg"
					/>
					<meta
						property="og:url"
						content="http://euro-travel-example.com/index.htm"
					/>
				</Helmet>
				<WrappedComponent {...props} />
			</>
		);
	};
}
