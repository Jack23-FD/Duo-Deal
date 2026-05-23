import { Card, Tooltip } from 'antd';

const defaultActivityDays = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  level: Math.floor(Math.random() * 4), // 0 to 3 intensity
  date: `2024-05-${(i % 31) + 1}`
}));

const ActivityGrid = ({ data }) => {
  const days = data && data.length ? data : defaultActivityDays;

  const getColor = (level) => {
    switch (level) {
      case 1: return '#fff1cc';
      case 2: return '#ffd591';
      case 3: return '#ff8c00';
      default: return '#f5f5f5';
    }
  };

  return (
    <Card className="modern-card" title="Task History">
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '4px',
        maxWidth: '100%'
      }}>
        {days.map((day) => (
          <Tooltip key={day.id} title={`${day.date}: ${day.level} tasks`}>
            <div 
              style={{ 
                aspectRatio: '1/1', 
                backgroundColor: getColor(day.level),
                borderRadius: '2px',
                border: '1px solid rgba(0,0,0,0.02)'
              }} 
            />
          </Tooltip>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', fontSize: '10px', color: '#8c8c8c' }}>
        <span>Less</span>
        <div style={{ display: 'flex', gap: '2px', margin: '0 4px' }}>
          {[0, 1, 2, 3].map(l => (
            <div key={l} style={{ width: '10px', height: '10px', backgroundColor: getColor(l) }} />
          ))}
        </div>
        <span>More</span>
      </div>
    </Card>
  );
};

export default ActivityGrid;
