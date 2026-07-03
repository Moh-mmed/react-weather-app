import { memo } from 'react';

const Tooltip = () => {
  return (
    <div
      className="absolute opacity-0 top-[calc(100%+8px)] left-[10%] bg-accent-coral/92 rounded-[15px] px-[13px] py-3 text-[0.7rem] text-white animate-displayTooltip z-[2]
                 after:content-[''] after:absolute after:-top-1.5 after:left-[15px] after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-b-[6px] after:border-b-accent-coral/92"
    >
      Sorry, You have entered a wrong city name
    </div>
  );
};

export default memo(Tooltip);