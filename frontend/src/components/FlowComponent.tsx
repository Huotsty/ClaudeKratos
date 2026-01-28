import React from 'react'

interface UiNode {
  type: string
  group: string
  attributes: any
  messages?: Array<{ text: string; type: string }>
  meta?: {
    label?: {
      text: string
    }
  }
}

interface FlowComponentProps {
  flow: any
  onSubmit: (values: any) => void
}

export const FlowComponent: React.FC<FlowComponentProps> = ({ flow, onSubmit }) => {
  const [formData, setFormData] = React.useState<Record<string, any>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const renderNode = (node: UiNode) => {
    const { attributes, meta } = node
    const label = meta?.label?.text || attributes.name || ''

    if (attributes.node_type === 'input') {
      const inputType = attributes.type || 'text'
      
      if (inputType === 'hidden' || inputType === 'submit') {
        return null
      }

      return (
        <div key={attributes.name} className="mb-4">
          <label htmlFor={attributes.name} className="block text-sm font-medium mb-2">
            {label}
          </label>
          <input
            type={inputType}
            id={attributes.name}
            name={attributes.name}
            required={attributes.required}
            value={formData[attributes.name] || ''}
            onChange={(e) => handleInputChange(attributes.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            autoComplete={attributes.autocomplete}
          />
          {node.messages && node.messages.map((msg, idx) => (
            <p key={idx} className={`mt-1 text-sm ${msg.type === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
              {msg.text}
            </p>
          ))}
        </div>
      )
    }

    return null
  }

  const getSubmitButton = () => {
    const submitNodes = flow.ui.nodes.filter(
      (node: UiNode) => node.attributes.node_type === 'input' && node.attributes.type === 'submit'
    )

    if (submitNodes.length > 0) {
      return submitNodes.map((node: UiNode, idx: number) => (
        <button
          key={idx}
          type="submit"
          name={node.attributes.name}
          value={node.attributes.value}
          onClick={() => handleInputChange(node.attributes.name, node.attributes.value)}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {node.meta?.label?.text || 'Submit'}
        </button>
      ))
    }

    return (
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit
      </button>
    )
  }

  if (!flow) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {flow.ui.messages && flow.ui.messages.map((msg: any, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-md ${
                msg.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
              }`}
            >
              {msg.text}
            </div>
          ))}

          {flow.ui.nodes
            .filter((node: UiNode) => node.attributes.type !== 'hidden' && node.attributes.type !== 'submit')
            .map((node: UiNode) => renderNode(node))}

          {flow.ui.nodes
            .filter((node: UiNode) => node.attributes.type === 'hidden')
            .map((node: UiNode) => (
              <input
                key={node.attributes.name}
                type="hidden"
                name={node.attributes.name}
                value={node.attributes.value}
              />
            ))}

          {getSubmitButton()}
        </form>
      </div>
    </div>
  )
}
