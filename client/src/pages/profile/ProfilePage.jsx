import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Camera, Loader2, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { profileUpdateSchema, changePasswordSchema } from '@/schemas/userSchemas';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account and how others see you.</p>
      </div>

      <ProfileHeaderCard user={user} onAvatarUpdated={updateUser} />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileDetailsForm user={user} onUpdated={updateUser} />
        </TabsContent>

        <TabsContent value="security">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileHeaderCard({ user, onAvatarUpdated }) {
  const fileInputRef = useRef(null);

  const avatarMutation = useMutation({
    mutationFn: (file) => userService.updateAvatar(file),
    onSuccess: (res) => {
      onAvatarUpdated(res.data.user);
      toast.success('Avatar updated');
    },
    onError: (err) => toast.error(err.message || 'Could not update your avatar'),
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      e.target.value = '';
      return;
    }
    avatarMutation.mutate(file);
    e.target.value = ''; // allow re-selecting the same file later
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="relative">
          <Avatar className="size-16">
            <AvatarImage src={user?.avatar?.url} alt={user?.name} />
            <AvatarFallback className="text-lg">{user?.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarMutation.isPending}
            aria-label="Change avatar"
            className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            {avatarMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Camera className="size-3" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold">{user?.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="size-3.5 fill-warning text-warning" />
            {user?.ratingCount > 0 ? (
              <span>
                {user.ratingAverage.toFixed(1)} ({user.ratingCount} review{user.ratingCount === 1 ? '' : 's'})
              </span>
            ) : (
              <span>No ratings yet</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileDetailsForm({ user, onUpdated }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      college: user?.college || '',
      department: user?.department || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => userService.updateProfile(payload),
    onSuccess: (res) => {
      onUpdated(res.data.user);
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(err.message || 'Could not update your profile'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile details</CardTitle>
        <CardDescription>This is shown on your public profile to other students.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit((values) => updateMutation.mutate(values))} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="college">College</Label>
              <Input id="college" aria-invalid={Boolean(errors.college)} {...register('college')} />
              {errors.college && <p className="text-sm text-destructive">{errors.college.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="Computer Science" {...register('department')} />
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" placeholder="+91 98765 43210" {...register('phone')} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="A short intro other students will see..." {...register('bio')} />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm() {
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed');
      reset();
    } catch (err) {
      setServerError(err.message || 'Could not change your password');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>You&rsquo;ll stay logged in on this device after changing it.</CardDescription>
      </CardHeader>
      <CardContent>
        {serverError && (
          <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.currentPassword)}
              {...register('currentPassword')}
            />
            {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.newPassword)}
              {...register('newPassword')}
            />
            {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmNewPassword">Confirm new password</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmNewPassword)}
              {...register('confirmNewPassword')}
            />
            {errors.confirmNewPassword && (
              <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
