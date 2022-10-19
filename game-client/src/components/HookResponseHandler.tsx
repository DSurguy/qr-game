import React, { useState } from "react";
import { HookResponseContext } from "../context/hookResponse";
import { PluginHookResponse } from "../qr-types";
import { HookResponseWithId } from '../context/hookResponse'
import { v4 as uuidv4 } from "uuid";
import { HookResponseModal } from "./HookResponseModal";

type Props = {
  children?: React.ReactNode;
}

export function HookResponseHandler ({ children }: Props) {
  // Test message:
  // const [responses, setResponses] = useState<HookResponseWithId[]>([{
  //   id: uuidv4(),
  //   message: `# This is a test\nThis should be a paragraph\n- List\n- List?`,
  //   icon: "crown-off"
  // }]);
  const [responses, setResponses] = useState<HookResponseWithId[]>([])

  const addResponses = (newResponses: PluginHookResponse[]) => {
    setResponses(
      responses.concat(newResponses.map(response => ({
        ...response,
        id: uuidv4()
      })))
    )
  }

  const removeResponse = (responseId: string) => {
    setResponses(responses.filter(response => response.id !== responseId))
  }

  const modalList = responses[0] ? [responses[0]] : null;

  return <HookResponseContext.Provider value={{
    responses,
    addResponses,
    removeResponse
  }}>
    {children}
    { modalList && modalList.map(response => <HookResponseModal key={response.id} response={response} opened={true} onClose={() => removeResponse(response.id)} />)}
  </HookResponseContext.Provider>
}