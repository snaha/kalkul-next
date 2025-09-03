export const UNSUBSCRIBE_LINK = '{{{RESEND_UNSUBSCRIBE_URL}}}'

// Kalkul Email Colors
export const EMAIL_COLORS = {
	// Primary colors
	primary: '#008765',
	darkText: '#303030',
	lightText: '#555555',

	// Background colors
	backgroundBeige: '#F9F3EB',
	cardBackground: '#FFFCF9',

	// Border and divider colors
	border: '#E5DFD5',

	// Interactive colors
	link: '#008765',
} as const

// Typography styles
export const TYPOGRAPHY_STYLES = {
	mainHeading: {
		margin: '32px 0 32px 0',
		fontSize: '28px',
		fontWeight: '600',
		color: EMAIL_COLORS.darkText,
		textAlign: 'center' as const,
		lineHeight: '1.2',
	},

	sectionHeading: {
		margin: '48px 0 24px 0',
		fontSize: '24px',
		fontWeight: '600',
		color: EMAIL_COLORS.darkText,
		textAlign: 'center' as const,
	},

	bodyText: {
		fontSize: '16px',
		lineHeight: '1.5',
		color: EMAIL_COLORS.darkText,
	},

	bodyTextCentered: {
		margin: '32px 0 0 0',
		fontSize: '16px',
		lineHeight: '1.5',
		color: EMAIL_COLORS.darkText,
		textAlign: 'center' as const,
	},

	introText: {
		margin: '0 0 48px 0',
		fontSize: '18px',
		lineHeight: '1.5',
		color: EMAIL_COLORS.darkText,
		textAlign: 'center' as const,
	},

	listText: {
		fontSize: '16px',
		lineHeight: '1.5',
		color: EMAIL_COLORS.darkText,
		textAlign: 'left' as const,
		margin: '0',
	},

	footerText: {
		margin: '0',
		color: EMAIL_COLORS.lightText,
		fontSize: '12px',
		lineHeight: '16px',
		textAlign: 'center' as const,
	},

	footerTextLast: {
		margin: '0',
		color: EMAIL_COLORS.lightText,
		fontSize: '12px',
		textAlign: 'center' as const,
	},

	illustration: {
		margin: '24px 0',
		fontSize: '60px',
		opacity: '0.3',
	},
} as const

// Layout styles
export const LAYOUT_STYLES = {
	emailContainer: {
		maxWidth: '592px',
		backgroundColor: EMAIL_COLORS.cardBackground,
		margin: '0 auto',
		padding: '48px 32px 32px 32px',
		border: `solid 1px ${EMAIL_COLORS.border}`,
		borderRadius: '4px',
	},

	headerSection: {
		padding: '0',
		textAlign: 'center' as const,
		margin: '0 auto',
	},

	mainSection: {
		backgroundColor: EMAIL_COLORS.backgroundBeige,
		padding: '48px 32px',
	},

	mainCard: {
		backgroundColor: EMAIL_COLORS.cardBackground,
		border: `1px solid ${EMAIL_COLORS.border}`,
		borderRadius: '4px',
		padding: '48px 32px',
		margin: '0 auto',
		maxWidth: '591px',
	},

	illustrationSection: {
		textAlign: 'center' as const,
		margin: '48px 0',
	},

	buttonSection: {
		padding: '0',
		textAlign: 'center' as const,
		margin: '16px auto',
	},

	buttonContainer: {
		padding: '12px',
		textAlign: 'center' as const,
		backgroundColor: EMAIL_COLORS.darkText,
		color: EMAIL_COLORS.backgroundBeige,
		borderRadius: '4px',
		fontSize: '16px',
		lineHeight: '150%',
		fontWeight: 'bold',
	},

	footerSection: {
		backgroundColor: EMAIL_COLORS.backgroundBeige,
		textAlign: 'center' as const,
		padding: '32px',
	},

	footerContainer: {
		margin: '0 auto',
		textAlign: 'center' as const,
		maxWidth: '592px',
	},
} as const

// Link styles
export const LINK_STYLES = {
	primary: {
		color: EMAIL_COLORS.link,
	},
	secondary: {
		color: EMAIL_COLORS.darkText,
	},
} as const
