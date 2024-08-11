"use client"
import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { UserCredential, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
  Flex,
} from '@mantine/core';
import { signInWithGoogle, signIn } from '../firebase-auth';
import { GoogleButton } from './GoogleButton';
import { auth } from '../firebase-config';

interface FormValues {
  email: any;
  name?: string;
  password: string;
  terms?: boolean;
}

export function AuthenticationForm(props: PaperProps) {
  const [type, toggle] = useToggle(['login', 'register']);
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const handleLoginResult = (loginResult: UserCredential) => {
    const user = loginResult.user;
    if (user) {
      navigate('/');
    }
  }
  // Hanler for login button click
  const handleGoogleLogin = async () => {
    try {
      const loginResult = await signInWithGoogle();
      handleLoginResult(loginResult);
    } catch (error) {
      console.log('Error signing in with Google:', error);
      console.log(error);
    }
  };

  const handleEmailLogin = async (values: FormValues) => {
    // e.preventDefault();
    try {
      const loginResult = await signIn(values.email, values.password);
      handleLoginResult(loginResult);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRegister = async (data: FormValues) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Flex h={"100vh"} w={"100vw"}
      direction="row" gap="md" p="md"
      justify={"center"} align={"center"} >
      <Paper radius="md" p="xl" withBorder {...props} >
        <Text size="lg" fw={500}>
          Welcome to Sahred Cart App, {type} with
        </Text>

        <Group grow mb="md" mt="md">
          <GoogleButton radius="xl" onClick={handleGoogleLogin}>Google</GoogleButton>
        </Group>

        <Divider label="Or continue with email" labelPosition="center" my="lg" />

        <form
          onSubmit={form.onSubmit(async (values) => type === 'register' ? handleRegister(values) : handleEmailLogin(values))}
        >
          <Stack>
            {type === 'register' && (
              <TextInput
                label="Name"
                id='name'
                placeholder="Your name"
                value={form.values.name}
                onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                radius="md"
              />
            )}

            <TextInput
              required
              label="Email"
              id='email'
              name='email'
              placeholder="hello@mantine.dev"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email && 'Invalid email'}
              radius="md"
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password && 'Password should include at least 6 characters'}
              radius="md"
            />

            {type === 'register' && (
              <Checkbox
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
              />
            )}
          </Stack>

          <Group justify="space-between" mt="xl">
            <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
              {type === 'register'
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </Anchor>
            <Button type="submit" radius="xl">
              {upperFirst(type)}
            </Button>
          </Group>
        </form>
      </Paper>
    </Flex>
  );
}