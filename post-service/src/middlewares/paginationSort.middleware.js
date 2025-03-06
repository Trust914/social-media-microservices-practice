import {
  ALLOWED_SORT_FIELDS,
  DEFAULT_SORT_BY,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
} from "../config/service.config.js";
import { logger } from "../utils/logger.util.js";

export const paginationMiddleware = (req, res, next) => {
  const reqPage = parseInt(req.query.page);
  const reqLimit = parseInt(req.query.limit);

  logger.debug("page", reqPage)
  const currentPage = reqPage > 0? reqPage : PAGINATION_DEFAULT_PAGE;
  const limit = reqLimit > 0 ? reqLimit : PAGINATION_DEFAULT_LIMIT;
  const skip = (currentPage - 1) * limit;

  req.pagination = {
    currentPage,
    limit,
    skip,
  };
  next();
};

export const sortMiddleware = (req, res, next) => {
  const reqSortBy = ALLOWED_SORT_FIELDS.includes(req.query.sortBy)
    ? req.query.sortBy
    : DEFAULT_SORT_BY;
  const reqSortOrder = req.query.order === "dsc" ? -1 : 1;

  const sortBy = {};
  sortBy[reqSortBy] = reqSortOrder;

  req.sort = sortBy;
  next();
};
