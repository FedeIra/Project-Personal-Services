const sqsBody = {
  reportType: 'liquidacion',
  parameters: {
    employeeId: '12345',
    period: '2024-05',
  },
};

const createReport = async () => {
  console.log('Creating report with parameters:', sqsBody);
};

createReport().catch((error) => {
  console.error('Error creating report:', error);
});
