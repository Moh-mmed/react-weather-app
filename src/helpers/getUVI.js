const getUVI = (UVI) =>{
  if (UVI <= 2) return "low";
  else if (UVI <= 5) return "moderate";
  else if (UVI <= 7) return "high";
  else if (UVI <= 10) return "very high";
  else return "extreme";
};
export default getUVI