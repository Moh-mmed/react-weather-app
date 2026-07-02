import { memo } from 'react'
import { StyledTooltip} from './StyledNavComponents'
const Tooltip = () => {
  return (
    <StyledTooltip>
      Sorry, You have entered a wrong city name
    </StyledTooltip>
  );
}

export default memo(Tooltip);