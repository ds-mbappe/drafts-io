import { Avatar, Button, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react'
import { PencilIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { useSession } from "next-auth/react"
import { v2 as cloudinary } from "cloudinary";
import { getFollowData } from '@/actions/getFollowData';

const ProfileModal = ({ changeDialogOpenState, dialogOpen, user, onUserUpdated }: {
	changeDialogOpenState: (isOpen: boolean) => void | undefined,
	dialogOpen: boolean,
	user: any | undefined,
	onUserUpdated: Function,
}) => {
	const [editPersonalInfo, setEditPersonalInfo] = useState(false);
	const { data: session, status, update } = useSession();
	const [loading, setLoading] = useState(false);
	const [isPictureLoading, setPictureLoading] = useState(false);
	const [follow, setFollow] = useState<any>({
		followers: 0,
		following: 0,
	})
	const [editUser, setEditUser] = useState<any>({
		firstname: "",
		lastname: "",
		email: "",
		phone: "",
		avatar: "",
		followers: 0,
		following: 0,
	});

	const saveUserInfo = async () => {
	  setLoading(true);

	  let formData = {
      id: user?.id,
      firstname: editUser?.firstname,
      lastname: editUser?.lastname,
      email: editUser?.email,
	  	phone: editUser?.phone
    }

    const response = await fetch(`/api/user/${user?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    })
    const data = await response.json()

		if (response.ok) {
			await update({ ...data.user })
			setEditPersonalInfo(false);
			onUserUpdated()

			toast.success(`User updated`, {
				description: `You have successfully updated your info!`,
				duration: 5000,
				important: true,
			})
		} else {
			toast.success(`Error`, {
				description: `Error updating user info`,
				duration: 5000,
				important: true,
			})
		}
		
		setLoading(false);
		changeDialogOpenState(false)
	}

	const onOpenPicker = () => {
		const picker = document.getElementById('picker')
		if (picker) {
			picker.click()
		}
	}

	const cancelAndRollback = () => {
		setEditPersonalInfo(prev => !prev);
		setEditUser((prev: any) => ({
			...user,
			followers: follow?.followers,
			following: follow?.following,
		}))
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setPictureLoading(true)
		const file = e.target?.files?.[0]
		if (file) {
			const timestamp = Math.round((new Date).getTime()/1000)
      const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: "profile_pictures",
      }, process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET as string )

			const formData = new FormData()
			formData.append('file', file)
			formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string)
			formData.append('signature', signature)
			formData.append('timestamp', JSON.stringify(timestamp))
			formData.append('folder', 'profile_pictures')

			const result = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string}/auto/upload`, {
				method: 'POST',
				body: formData,
			})

			if (result?.ok) {
				const data = await result.json()
				await update({ ...user, avatar: data?.url })

				const formData = {
					id: user?.id,
					avatar: data?.url
				}
		
				const response = await fetch(`/api/user/${user?.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ formData }),
				})

				if (response?.ok) {
					setEditUser({ ...editUser, avatar: data?.url })

					toast.success(`Success`, {
						description: 'Successfully updated avatar!',
						duration: 5000,
						important: true,
					})
				} else {
					toast.error(`Error`, {
						description: 'Error updating avatar. Please try again!',
						duration: 5000,
						important: true,
					})
				}
			} else {
				toast.error(`Error`, {
					description: 'Error updating avatar. Please try again!',
					duration: 5000,
					important: true,
				})
			}
		}
		setPictureLoading(false)
	}

	// Set follow data
	const setFollowData = async () => {
		const data = await getFollowData(user?.id);
		setFollow({
			followers: data?.followers_count,
			following: data?.following_count,
		})
		setEditUser((prev: any) => ({
			...prev,
			followers: data?.followers_count,
			following: data?.following_count,
		}))
	}

	// Use states
	useEffect(() => {
		setEditUser({ ...editUser, ...user });
		setFollowData();
	}, [user])

  return (
    <Modal placement="center" isOpen={dialogOpen} scrollBehavior="inside" onOpenChange={changeDialogOpenState}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">{'Profile'}</ModalHeader>

				<ModalBody className="p-4">
					<div className="w-full flex flex-col gap-2">
						<div className="w-full flex flex-col gap-2.5 p-3">
							<div className="w-full flex items-center gap-4">
								{/* Avatar + Edit */}
								<div className="w-[60px] h-[60px] flex relative">
									<Avatar
										src={editUser?.avatar}
										showFallback
										name={editUser?.firsname?.split('')?.[0]}
										className="w-[60px] h-[60px] text-large"
									/>

									<Button
										variant="solid"
										radius="full"
										size="sm"
										isLoading={isPictureLoading}
										isIconOnly
										className="absolute bottom-0 -right-2"
										onPress={onOpenPicker}
									>
										<PencilIcon size={16} className="text-foreground-500" />
									</Button>

									<input
										id="picker"
										type="file"
										className="hidden opacity-0"
										accept="image/png, image/gif, image/jpeg"
										onChange={handleFileChange}
									/>
								</div>

								{/* Firstname + Lastname + Email */}
								<div className="flex flex-col">
									<p className="text-base font-medium">
										{`${user?.firstname} ${user?.lastname}`}
									</p>

									<p className="text-sm font-normal text-foreground-500">
										{user?.email}
									</p>
								</div>
							</div>

							{/* Following & Followers */}
							<div className="flex items-center gap-5">
								<div className="flex items-center gap-2">
									<p className="text font-medium">{editUser?.followers}</p>
									<p className="text-sm font-medium text-foreground-500">{`Followers`}</p>
								</div>

								<div className="flex items-center gap-2">
									<p className="text font-medium">{editUser?.following}</p>
									<p className="text-sm font-medium text-foreground-500">{`Following`}</p>
								</div>
							</div>
						</div>

						<Divider />

						{/* Personal information */}
						<div className="w-full p-3 flex flex-col gap-3">
							<div className="h-[32px] flex items-center justify-between">
								<p className="text-sm font-medium">
									{'Personal information'}
								</p>

								{!editPersonalInfo &&
									<Button
										variant="bordered"
										radius="full"
										size="sm"
										onClick={() => setEditPersonalInfo(prev => !prev)}
									>
										{'Edit'}
									</Button>
								}
							</div>

							<div className="flex flex-col gap-3">
								{/* Firstname */}
								<div className="flex flex-col gap-1">
									<p className="text-sm font-normal text-foreground-500">
										{'First Name'}
									</p>

									<Input
										variant='bordered'
										id="firstname"
										isDisabled={!editPersonalInfo}
										autoComplete="new-password"
										placeholder="Firstname"
										value={editUser.firstname}
										onValueChange={(value) => setEditUser({...editUser, firstname: value})}
									/>
								</div>

								{/* Lastname */}
								<div className="flex flex-col gap-1">
									<p className="text-sm font-normal text-foreground-500">
										{'Last Name'}
									</p>

									<Input
										variant='bordered'
										id="lastname"
										isDisabled={!editPersonalInfo}
										autoComplete="new-password"
										placeholder="Lastname"
										value={editUser.lastname}
										onValueChange={(value) => setEditUser({...editUser, lastname: value})}
									/>
								</div>

								{/* Email address */}
								<div className="flex flex-col gap-1">
									<p className="text-sm font-normal text-foreground-500">
										{'Email address'}
									</p>

									<Input
										variant='bordered'
										id="email"
										type="email"
										isDisabled
										autoComplete="new-password"
										placeholder="Email"
										value={editUser.email}
										// onValueChange={(value) => setEditUser({...editUser, email: value})}
									/>
								</div>

								{/* Phone number */}
								<div className="flex flex-col gap-1">
									<p className="text-sm font-normal text-foreground-500">
										{'Phone'}
									</p>

									<Input
										variant='bordered'
										id="phone"
										isDisabled={!editPersonalInfo}
										autoComplete="new-password"
										placeholder="Phone number"
										value={editUser.phone}
										onValueChange={(value) => setEditUser({...editUser, phone: value})}
									/>
								</div>
							</div>
						</div>
					</div>
				</ModalBody>

				<ModalFooter>
					{editPersonalInfo &&
						<Button
							color="danger"
							variant="light"
							className='cursor-pointer'
							onClick={cancelAndRollback}
						>
							{'Cancel'}
						</Button>
					}

					<Button
						color='primary'
						variant="light"
						isLoading={loading}
						isDisabled={!editPersonalInfo}
						className='cursor-pointer'
						onClick={saveUserInfo}
					>
						{'Save'}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
  )
}

export default ProfileModal