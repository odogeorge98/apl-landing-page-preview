import React, { Fragment } from 'react'
import { ForwardIcon, TrashIcon } from './Icons'
import Link from 'next/link';

// interface ActionCardProps {
//   onClose: () => void;
//   onResend?: () => void;
//   onDelete?: () => void;
//   isResending?: boolean;
//   isDeleting?: boolean;
// }


interface ActionCardProps {
  actionItems: {
    icon?: React.ElementType;
    state?: boolean;
    trigger?: () => void;
    color?: string;
    actionText: string;
    loadingText: string;
    link?: boolean;
    href?: string;

  }[],
  onClose: () => void;
  data?: any;
}

const ActionCard = ({ 
  onClose,
  actionItems,
  data
}: ActionCardProps) => {
    return (
        <div 
        className="z-10 absolute right-10 w-max bg-white rounded-[8px] shadow-lg flex flex-col cursor-pointer"
        >
            {/* <div 
              onClick={() => {
                if (!isResending) {
                  onResend?.();
                  onClose();
                }
              }} 
              className={`p-2 inline-flex gap-2 hover:bg-[#F7F7F7] text-[#212121] text-sm ${
                isResending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
                <ForwardIcon />
                <span>{isResending ? 'Resending...' : 'Resend'}</span>
            </div>
            <div 
              onClick={() => {
                if (!isDeleting) {
                  onDelete?.();
                  onClose();
                }
              }} 
              className={`p-2 inline-flex gap-2 hover:bg-[#F7F7F7] text-[#D00416] text-sm ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
                <TrashIcon />
                <span>{isDeleting ? 'Deleting...' : 'Cancel & Delete'}</span>
            </div> */}
            {
              actionItems.map((action: any, i: React.Key) => {
                const Icon = action.icon
                return (
                  <Fragment 
                  key={i}
                  >
                    {
                      action.link ? (
                      <Link
                      href={action.href || `/dashboard/organizations/${data.name}`} 
                      className={`w-full px-4 py-3 text-left text-sm text-[#212121] hover:bg-gray-50 transition-colors ${
                          action.state ? 'opacity-50 cursor-not-allowed' : ''
                        } ${actionItems.indexOf(action) !== actionItems.length - 1 ? 'border-b border-[#E4E4E4]' : ''}`}
                      >
                        {action.actionText}
                        </Link>
                    ) : (
                        <div
                        onClick={() => {
                          if (!action.state) {
                            action.trigger?.();
                            onClose();
                          }
                        }} 
                        className={`w-full px-4 py-3 text-left text-sm text-[#212121] hover:bg-gray-50 transition-colors ${
                          action.state ? 'opacity-50 cursor-not-allowed' : ''
                        } ${actionItems.indexOf(action) !== actionItems.length - 1 ? 'border-b border-[#E4E4E4]' : ''}`}
                        style={{
                          color: action.color || '#212121'
                        }}
                        >
                          {Icon && <Icon className="inline mr-2" />}
                          <span>{action.state ? action.loadingText : action.actionText}</span>
                        </div>
                      )
                    }
                  </Fragment>
                )
              })
            }
        </div>
    )
}

export default ActionCard