export const findOne = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  const doc = model.findOne(filter).select(select);
  if (options.populate) {
    doc.populate(options.populate);
  }
  if (options.lean) {
    doc.lean();
  }
  return await doc.exec();
};

export const findById = async ({
  model,
  id,
  select = "",
  populate = [],
  lean = false,
  validateBeforeSave = true,
}) => {
  let query = model.findById(id);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);
  if (lean) query = query.lean();

  return await query;
};

export const create = async ({
  model,
  data = {},
  select = "",
} = {}) => {
  return await model.create(data);
};

export const createOne = async ({
  model,
  data = {},
  select = "",
  options = { validateBeforeSave: true },
} = {}) => {
  const doc = await create({ model, data: [data], options });
  return doc;
};

export const update = async ({
  model,
  filter = {},
  data = {},
  select = "",
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.updateOne(filter, data, options);
};

export const updateOne = async ({
  model,
  filter = {},
  data = {},
  select = "",
  options = { validateBeforeSave: true },
} = {}) => {
  const doc = await update({ model, filter, data: [data], options });
  return doc;
};

export const deleteOne = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  return await model.deleteOne(filter, options);
};

export const deleteMany = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  return await model.deleteMany(filter, options);
};

export const find = async ({
  model,
  filter = {},
  select = "",
  populate = [],
  sort = {},
  lean = false,
} = {}) => {
  let query = model.find(filter);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);
  if (Object.keys(sort).length) query = query.sort(sort);
  if (lean) query = query.lean();

  return query;
};

export const findAll = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  const doc = await model.find(filter).select(select);
  if (options.populate) {
    doc.populate(options.populate);
  }
  if (options.lean) {
    doc.lean();
  }
  return await doc.exec();
};

export const count = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  const doc = await model.countDocuments(filter);
  return await doc.exec();
};

export const aggregate = async ({
  model,
  pipeline = [],
  options = {},
} = {}) => {
  const doc = await model.aggregate(pipeline);
  if (options.populate) {
    doc.populate(options.populate);
  }
  if (options.lean) {
    doc.lean();
  }
  return await doc.exec();
};

export const aggregateOne = async ({ model, pipeline = [], options = {} }) => {
  const doc = await model.aggregate(pipeline);
  if (options.populate) {
    doc.populate(options.populate);
  }
  if (options.lean) {
    doc.lean();
  }
  return await doc.exec();
};

export const aggregateMany = async ({ model, pipeline = [], options = {} }) => {
  const doc = await model.aggregate(pipeline);
  if (options.populate) {
    doc.populate(options.populate);
  }
  if (options.lean) {
    doc.lean();
  }
  return await doc.exec();
};

export const aggregateCount = async ({
  model,
  pipeline = [],
  options = {},
}) => {
  const doc = await model.aggregate(pipeline);
  if (options.populate) {
    doc.populate(options.populate);
  }
  if (options.lean) {
    doc.lean();
  }
  return await doc.exec();
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  update = {},
  options = { new: true },
}) => {
  return await model.findOneAndUpdate(filter, update, options);
  return await model.create(data, options);
};
