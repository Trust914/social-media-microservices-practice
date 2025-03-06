export const getPaginationDetails = (total, currentPage, limit) => {
  const totalpages = Math.ceil(total / limit); // total count of the data / num of data to show per page
  const hasNextpage = currentPage < totalpages;
  const hasPrevpage = currentPage > 1;

  return {
    total,
    totalpages,
    currentPage,
    hasNextpage,
    hasPrevpage,
    nextPage: hasNextpage ? currentPage + 1 : null,
    prevPage: hasPrevpage ? currentPage - 1 : null,
  };
};
