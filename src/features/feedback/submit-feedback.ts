import {
  FEEDBACK_RECIPIENTS,
  FEEDBACK_WEB3FORMS_ENDPOINT,
  feedbackIsConfigured,
  feedbackWeb3FormsAccessKeys,
} from '@/constants/support';

export type FeedbackPayload = {
  name: string;
  email: string;
  message: string;
};

export type FeedbackValidation = Partial<Record<keyof FeedbackPayload, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SETUP_MESSAGE =
  'Feedback is not configured yet. Set EXPO_PUBLIC_FEEDBACK_WEB3FORMS_KEYS in .env.local, then restart with: npx expo start -c';

export function validateFeedback(payload: FeedbackPayload): FeedbackValidation {
  const errors: FeedbackValidation = {};
  const name = payload.name.trim();
  const email = payload.email.trim();
  const message = payload.message.trim();

  if (name.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  }
  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (message.length < 10) {
    errors.message = 'Please write at least 10 characters so we can understand your feedback.';
  }

  return errors;
}

export function hasValidationErrors(errors: FeedbackValidation): boolean {
  return Object.keys(errors).length > 0;
}

type Web3FormsResponse = {
  success?: boolean;
  message?: string;
};

async function postToWeb3Forms(accessKey: string, payload: FeedbackPayload): Promise<void> {
  const name = payload.name.trim();
  const email = payload.email.trim();
  const message = payload.message.trim();

  const res = await fetch(FEEDBACK_WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      access_key: accessKey,
      name,
      email,
      replyto: email,
      subject: `DocKit feedback from ${name}`,
      message,
    }),
  });

  let data: Web3FormsResponse = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response — treat as failure below.
  }

  if (!res.ok || !data.success) {
    throw new Error(
      data.message ??
        'Could not send your feedback right now. Check your connection and try again.',
    );
  }
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  if (!feedbackIsConfigured()) {
    throw new Error(SETUP_MESSAGE);
  }

  const accessKeys = feedbackWeb3FormsAccessKeys();
  const results = await Promise.allSettled(
    accessKeys.map((accessKey) => postToWeb3Forms(accessKey, payload)),
  );

  const failures = results.filter((result) => result.status === 'rejected');
  if (failures.length === results.length) {
    const reason = failures[0];
    if (reason.status === 'rejected') {
      throw reason.reason instanceof Error
        ? reason.reason
        : new Error('Could not send your feedback. Please try again.');
    }
  }

  if (failures.length > 0 && accessKeys.length > 1) {
    console.warn(
      `Feedback delivered to ${results.length - failures.length}/${results.length} inboxes.`,
      FEEDBACK_RECIPIENTS,
    );
  }
}
