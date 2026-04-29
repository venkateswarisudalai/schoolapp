import StudentReportEditor from '../shared/StudentReportEditor';

interface Props { onBack: () => void }

const StudentReport = ({ onBack }: Props) => (
  <StudentReportEditor onBack={onBack} scope="all" />
);

export default StudentReport;
