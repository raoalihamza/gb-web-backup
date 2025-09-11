import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Dropdown,
	DropdownToggle,
	DropdownItem,
	DropdownMenu,
	Button
} from 'reactstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import NewsViewModel from './NewsViewModel';
import { useAuth } from '../../../shared/providers/AuthProvider';

export default function NewsPicker({ news, setNews }) {
	const [t] = useTranslation('common');
	const [userID] = useAuth();
	const news = useSelector((state) => state.news.news)

	const [opened, setOpened] = React.useState(false);

	const newsViewModel = React.useMemo(
		() => new NewsViewModel(userID),
		[userID],
	);

	React.useEffect(() => {
		let _isUnmounted = false;

		if (!_isUnmounted) {
			newsViewModel.fetchNews(userID);
		}

		return () => {
			_isUnmounted = true;
		};
	}, [newsViewModel]);

	const toggleDropdown = () => {
		setOpened((previousState) => !previousState);
	};

	const handleItemClick = (item) => {
		setNews(item);
	};

	return (
		<Dropdown isOpen={opened} toggle={toggleDropdown}>
			<DropdownToggle
				caret
				className="news-picker-dropdown-toggle mb-0"
				clearable
			>
				{t('meta.organisation.news')}: {news?.[news] ?? "None"}
				<Button close size="sm" color="secondary" onClick={() => {
					if (!opened) {
						toggleDropdown()
					}
					setNews(undefined)
				}}>ˣ</Button>
			</DropdownToggle>
			<DropdownMenu
				className="news-picker-dropdown-toggle mb-0"
			>
				{(news && Object.keys(news).length !== 0) ? Object.entries(news).map(([key, value]) => (
					<DropdownItem
						key={key}
						role="button"
						tabIndex={0}
						onClick={() => handleItemClick(key)}
					>
						{value}
					</DropdownItem>
				)) : <span style={{ fontSize: 12 }}>{t('news.no_news')}</span>}
			</DropdownMenu>
		</Dropdown>
	);
}

NewsPicker.defaultProps = {
	news: undefined,
	setNews: () => null,
};
NewsPicker.propTypes = {
	news: PropTypes.shape({
		id: PropTypes.number,
		label: PropTypes.string,
	}),
	setNews: PropTypes.func,
};
