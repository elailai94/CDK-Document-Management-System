/**
 * This function is used when updating an item in DynamoDB. It
 * generates the update expression and attribute values.
 */
function generateUpdateExpressions(body) {
  const expressionAttributeValues = {};
  const updateExpression = [];

  Object.keys(body).forEach(key => {
    expressionAttributeValues[`:${key}`] = body[key];
    updateExpression.push(`${key} = :${key}`);
  });

  return {
    expressionAttributeValues,
    updateExpression: `set ${updateExpression.join(", ")}`,
  };
}

export { generateUpdateExpressions };
