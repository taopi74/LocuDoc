import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { ToolScreen } from '@/components/ui/tool-screen';
import { Brand, Spacing } from '@/constants/theme';
import {
  hasValidationErrors,
  submitFeedback,
  validateFeedback,
  type FeedbackValidation,
} from '@/features/feedback/submit-feedback';

export default function FeedbackScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FeedbackValidation>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const payload = { name, email, message };
    const nextErrors = validateFeedback(payload);
    setErrors(nextErrors);
    setSubmitError(null);

    if (hasValidationErrors(nextErrors)) return;

    setLoading(true);
    try {
      await submitFeedback(payload);
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolScreen
      title="Send feedback"
      subtitle="Tell us what you think so we can improve DocKit."
      taskComplete={sent}
      taskCompleteMessage="Thanks — your feedback was sent. We read every message."
      scroll
    >
      <Card padded style={styles.formCard}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.intro}>
          Share your name, email, and a short message. Only this information leaves your device —
          your documents and files stay private on {Brand.name}.
        </ThemedText>

        <TextField
          label="Your name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
          }}
          placeholder="Jane Doe"
          autoCapitalize="words"
          autoComplete="name"
          editable={!loading}
        />
        {errors.name ? (
          <ThemedText type="small" themeColor="danger">
            {errors.name}
          </ThemedText>
        ) : null}

        <TextField
          label="Email address"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!loading}
        />
        {errors.email ? (
          <ThemedText type="small" themeColor="danger">
            {errors.email}
          </ThemedText>
        ) : null}

        <TextField
          label="Your message"
          value={message}
          onChangeText={(v) => {
            setMessage(v);
            if (errors.message) setErrors((e) => ({ ...e, message: undefined }));
          }}
          placeholder="What do you like? What could be better?"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={styles.messageInput}
          editable={!loading}
        />
        {errors.message ? (
          <ThemedText type="small" themeColor="danger">
            {errors.message}
          </ThemedText>
        ) : null}

        {submitError ? (
          <ThemedText type="small" themeColor="danger">
            {submitError}
          </ThemedText>
        ) : null}

        <View style={styles.actions}>
          <Button
            label="Send feedback"
            icon="send"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            fullWidth
          />
        </View>
      </Card>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: Spacing.three, maxWidth: 520, alignSelf: 'center', width: '100%' },
  intro: { lineHeight: 20 },
  messageInput: { minHeight: 120, paddingTop: Spacing.two + 4 },
  actions: { marginTop: Spacing.one },
});
