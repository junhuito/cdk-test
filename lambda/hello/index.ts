import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { get } from 'lodash';
import * as AWS from 'aws-sdk';
import axios from 'axios';
import * as awsplaywright from 'playwright-aws-lambda';
import * as pp from 'playwright';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    // console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    const test = get(event, ['body'], 'wohoho');

    const result = await axios.get('https://jsonplaceholder.typicode.com/todos/1').then((response) => {
        return response.data;
    });

    console.log('eqwjijowq');

    // console.log('awsplaywright...', awsplaywright);

    console.log('result...', result);
    
    console.log('test...', test);
    // console.log('test...', test);
    // console.log('test...', test);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'hello world',
        }),
    };
};