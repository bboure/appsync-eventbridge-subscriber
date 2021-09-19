import { EventBridgeHandler } from 'aws-lambda';
import AWSAppSyncClient from 'aws-appsync';
import gql from 'graphql-tag';
import 'cross-fetch/polyfill';

const graphqlClient = new AWSAppSyncClient({
  url: process.env.APPSYNC_ENDPOINT!,
  region: process.env.AWS_REGION!,
  auth: {
    type: 'AWS_IAM',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      sessionToken: process.env.AWS_SESSION_TOKEN!,
    },
  },
  disableOffline: true,
});

const mutation = gql`
  mutation SendEvent($event: EventBridgeMessageInput!) {
    sendEvent(event: $event) {
      version
      id
      detailType
      source
      account
      time
      region
      resources
      detail
    }
  }
`;

export const handler: EventBridgeHandler<
  string,
  Record<string, unknown>,
  void
> = async (event) => {
  console.log(event);
 
  await graphqlClient.mutate({
    mutation,
    variables: {
      event: {
        version: event.version,
        id: event.id,
        detailType: event['detail-type'],
        source: event.source,
        account: event.account,
        time: event.time,
        region: event.region,
        resources: event.resources,
        detail: JSON.stringify(event.detail),
      },
    },
  });
};
