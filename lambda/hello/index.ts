// import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
// import { get } from 'lodash';
// import axios from 'axios';

// export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
export const abc = async (event: any, context: any): Promise<any> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    // console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    // const test = get(event, ['body'], 'wohoho');

    // const result = await axios.get('https://jsonplaceholder.typicode.com/todos/1').then((response) => {
    //     return response.data;
    // });

    console.log('eqwjijowq');

    console.log('another version again');
    console.log('woww, prune version');

    // console.log('awsplaywright...', awsplaywright);

    // console.log('result...', result);
    
    // console.log('test...', test);
    // console.log('test...', test);
    // console.log('test...', test);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'hello world',
        }),
    };
};