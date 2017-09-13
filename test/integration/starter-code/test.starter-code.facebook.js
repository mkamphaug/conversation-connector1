'use strict';

/**
 * Starter Code Integration Tests (pre-conversation and post-conversation)
 */

const assert = require('assert');
const openwhisk = require('openwhisk');
const facebookBindings = require('./../../resources/facebook-bindings.json').facebook;

describe('starter-code integration tests for facebook', () => {
  const ow = openwhisk();

  let params;
  let expectedResult;
  let facebookData;

  beforeEach(() => {
    params = {
      facebook: {
        sender: facebookBindings.sender,
        recipient: facebookBindings.recipient,
        message: {
          text: 'hello, world!'
        }
      },
      provider: 'facebook'
    };

    expectedResult = {
      recipient: facebookBindings.sender,
      raw_input_data: {
        facebook: params.facebook,
        provider: 'facebook',
        cloudant_key: 'facebook_1481847138543615_e808d814-9143-4dce-aec7-68af02e650a8_185643828639058',
        conversation: { input: { text: 'hello, world!' } }
      },
      message: { text: 'Output text from mock-convo.' },
      raw_output_data: {
        conversation: {
          output: { text: ['Output text from mock-convo.'] },
          context: {
            conversation_id: '06aae48c-a5a9-4bbc-95eb-2ddd26db9a7b',
            system: {
              branch_exited_reason: 'completed',
              dialog_request_counter: 1,
              branch_exited: true,
              dialog_turn_counter: 1,
              dialog_stack: [{ dialog_node: 'root' }],
              _node_output_map: { 'Anything else': [0] }
            }
          }
        }
      },
      workspace_id: 'e808d814-9143-4dce-aec7-68af02e650a8'
    };

    facebookData = {
      attachment: {
        type: 'template',
        payload: {
          elements: [
            {
              title: 'Output text from mock-convo.',
              buttons: [
                {
                  type: 'postback',
                  title: 'Enter T-Shirt Store',
                  payload: 'List all t-shirts'
                }
              ],
              subtitle: 'I can help you find a t-shirt',
              image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDQKvGUWTu5hStYHbjH8J3fZi6JgYqw6WY3CrfjB680uLjy2FF9A'
            }
          ],
          template_type: 'generic',
          image_aspect_ratio: 'square'
        }
      }
    };
  });

  it('validate starter-code-facebook actions work', () => {
    const actionName = 'starter-code/integration-pipeline-facebook';

    return ow.actions
      .invoke({
        name: actionName,
        blocking: true,
        result: true,
        params
      })
      .then(
        success => {
          assert.deepEqual(success, expectedResult);
        },
        error => {
          assert(false, error);
        }
      );
  }).retries(5);

  it(
    'validate starter-code handles facebook-specific data from conversation',
    () => {
      const actionName = 'starter-code/integration-pipeline-facebook-with-facebook-data';
      expectedResult.message = facebookData;
      expectedResult.raw_output_data.conversation.output.facebook = {};
      expectedResult.raw_output_data.conversation.output.facebook = facebookData;

      return ow.actions
        .invoke({ name: actionName, blocking: true, result: true, params })
        .then(
          result => {
            assert.deepEqual(result, expectedResult);
          },
          error => {
            assert(false, error);
          }
        );
    }
  )
    .timeout(5000)
    .retries(4);
});
