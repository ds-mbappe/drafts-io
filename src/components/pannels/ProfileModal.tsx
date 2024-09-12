import { Avatar, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import React from 'react'

const ProfileModal = ({ changeDialogOpenState, dialogOpen, user }: {
	changeDialogOpenState: (isOpen: boolean) => void | undefined,
	dialogOpen: boolean,
	user: any | undefined,
}) => {
  return (
    <Modal placement="center" isOpen={dialogOpen} onOpenChange={changeDialogOpenState}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">{'Profile'}</ModalHeader>

				<ModalBody className="p-5">
					<div className="w-full flex flex-col gap-6">
						<div className="w-full p-3 flex items-center gap-4 border border-divider rounded-[8px]">
							<Avatar
								src="https://i.pravatar.cc/150?u=a04258114e29026708c"
								className="w-[60px] h-[60px] text-large"
							/>

							<div className="flex flex-col gap-1">
								<p className="text-base font-medium">
									{'Dazai Osamu'}
								</p>

								<p className="text-sm font-normal text-foreground-500">
									{'Team Manager'}
								</p>
							</div>
						</div>

						<div className="w-full p-3 flex flex-col gap-8 border border-divider rounded-[8px]">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium">
									{'Personal information'}
								</p>

								Edit
							</div>

							<div className="flex flex-col gap-4">
								{/* Firstname */}
								<div className="flex flex-col gap-2">
									<p className="text-sm font-normal text-foreground-500">
										{'First Name'}
									</p>

									<p className="text-sm font-normal">
										{'Dazai'}
									</p>
								</div>

								{/* Lastname */}
								<div className="flex flex-col gap-2">
									<p className="text-sm font-normal text-foreground-500">
										{'Last Name'}
									</p>

									<p className="text-sm font-normal">
										{'Osamu'}
									</p>
								</div>

								{/* Email address */}
								<div className="flex flex-col gap-2">
									<p className="text-sm font-normal text-foreground-500">
										{'Email address'}
									</p>

									<p className="text-sm font-normal">
										{'dazaiosamu@yahoo.fr'}
									</p>
								</div>

								{/* Phone number */}
								<div className="flex flex-col gap-2">
									<p className="text-sm font-normal text-foreground-500">
										{'Phone'}
									</p>

									<p className="text-sm font-normal">
										{'+33 7 63 66 61 14'}
									</p>
								</div>
							</div>
						</div>
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
  )
}

export default ProfileModal