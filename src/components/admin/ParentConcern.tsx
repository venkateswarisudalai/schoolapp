import ParentConcernBoard from '../shared/ParentConcernBoard';

interface Props { onBack: () => void }

const ParentConcern = ({ onBack }: Props) => (
  <ParentConcernBoard onBack={onBack} role="admin" />
);

export default ParentConcern;
