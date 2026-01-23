export interface ProductRequest {
  id: string;
  userId?: string; // Optional, if we implement user sessions
  amazonUrl: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'purchased';
  submittedAt: Date;
  confirmationDetails?: {
    title: string;
    price: string;
    image: string;
    screenshotUrl: string;
    confirmedAt?: Date;
  };
}

// Simple in-memory store for demonstration purposes
const productRequests: ProductRequest[] = [];

export const addRequest = (amazonUrl: string, userId?: string): ProductRequest => {
  const newRequest: ProductRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    amazonUrl,
    status: 'pending',
    submittedAt: new Date(),
  };
  productRequests.push(newRequest);
  console.log('New product request added:', newRequest);
  return newRequest;
};

export const getRequest = (id: string): ProductRequest | undefined => {
  return productRequests.find(req => req.id === id);
};

export const getAllRequests = (): ProductRequest[] => {
  return [...productRequests]; // Return a copy to prevent external modification
};

export const updateRequestStatus = (
  id: string,
  status: 'pending' | 'confirmed' | 'rejected' | 'purchased',
  confirmationDetails?: ProductRequest['confirmationDetails']
): ProductRequest | undefined => {
  const request = productRequests.find(req => req.id === id);
  if (request) {
    request.status = status;
    if (confirmationDetails) {
      request.confirmationDetails = { ...confirmationDetails, confirmedAt: new Date() };
    }
    request.submittedAt = new Date(); // Update timestamp for status change
    console.log(`Request ${id} updated to status: ${status}`);
    return request;
  }
  return undefined;
};
