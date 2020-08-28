import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import {parseUserId } from '../../auth/utils'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('createTodo')

const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  logger.info("todo Id ", todoId)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  // const validTodoId = await todoExists(userId, todoId)
  const validTodoId = await todoExists(todoId)

  if (!validTodoId){
    return{
      statusCode:404,
      headers:{
        'Access-Control-Allow-Origin': "*"
      },
      body: JSON.stringify({
        error: 'Todo does not exist!!'
      })
    }
  }

  logger.info("abc")
  //
  var params = {
    TableName: todosTable,
    userId: parseUserId(jwtToken),
    Key: {
      todoId: todoId
    }
  }
  logger.info("params", params)
  //
  docClient.delete(params, function(err, data) {
    if (err) {
        logger.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2))
    } else {
        logger.info("DeleteItem succeeded:", JSON.stringify(data, null, 2))
    }
  })
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body:'Item deleted :)'
  }
}


async function todoExists(todoId: string){
  const result = await docClient
    .get({
      TableName: todosTable,
      Key:{
        todoId: todoId
      }
    })
    .promise()

    logger.info('Get todo: =. ', result)
    return !!result.Item
}
