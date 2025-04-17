'use client';

import { useState } from 'react';
import { useMessageSigning } from '../hooks/useMessageSigning';

export function MessageSigning() {
  const [message, setMessage] = useState('');
  const [signedMessage, setSignedMessage] = useState<{
    signature: string;
    recoveredAddress: string;
    verified: boolean;
  } | null>(null);
  
  const { signMessage } = useMessageSigning();
  
  const handleSignMessage = async () => {
    if (!message) return;
    
    try {
      const result = await signMessage.mutateAsync({ message });
      setSignedMessage({
        signature: result.signature,
        recoveredAddress: result.recoveredAddress,
        verified: result.verified,
      });
    } catch (error) {
      console.error('Failed to sign message:', error);
    }
  };
  
  const handleCopySignature = () => {
    if (signedMessage?.signature) {
      navigator.clipboard.writeText(signedMessage.signature);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Sign Message (ETH)</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message to Sign
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message to sign..."
          className="w-full p-3 border rounded-md mb-3 min-h-24"
        />
        <button
          onClick={handleSignMessage}
          disabled={!message.trim() || signMessage.isPending}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {signMessage.isPending ? 'Signing...' : 'Sign Message'}
        </button>
      </div>
      
      {signedMessage && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-medium mb-2">Signature</h3>
          <div className="flex mb-3">
            <input
              type="text"
              readOnly
              value={signedMessage.signature}
              className="flex-1 p-2 border rounded-l-md bg-gray-50 text-sm truncate"
            />
            <button
              onClick={handleCopySignature}
              className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
          
          <h3 className="font-medium mb-2">Recovered Address</h3>
          <p className="text-sm bg-gray-50 p-2 border rounded-md mb-3 break-all">
            {signedMessage.recoveredAddress}
          </p>
          
          <div className={`text-sm ${signedMessage.verified ? 'text-green-600' : 'text-red-600'}`}>
            {signedMessage.verified 
              ? '✓ Signature verified successfully!' 
              : '✗ Signature verification failed!'}
          </div>
        </div>
      )}
    </div>
  );
}