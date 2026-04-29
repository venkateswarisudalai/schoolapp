import ParentConcernBoard from '../shared/ParentConcernBoard';
import type { Child } from '../../types/index';

interface Props { onBack: () => void; children: Child[] }

const ParentConcern = ({ onBack, children }: Props) => (
  <ParentConcernBoard onBack={onBack} role="parent" children={children} />
);

export default ParentConcern;
