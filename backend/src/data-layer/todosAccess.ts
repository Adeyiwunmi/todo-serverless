import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'


const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todosAccess')
function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}
