import Switch from '@mui/material/Switch';

function DashboardSelector({
	dashboard,
	setDashboard
}: DashboardSelectorProps) {

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDashboard(event.target.checked ? "results" : "performance");
	};

	console.log(dashboard);

	return <Switch
		checked={dashboard === "results"}
		onChange={handleChange}
		inputProps={{ 'aria-label': 'controlled' }}
	/>
}

export default DashboardSelector;
