import { Button, Divider, Input } from '@heroui/react'
import Link from 'next/link'
import React from 'react'
import Icon from './Icon'

const Footer = () => {
  const complianceLinks = [
    { href: '/', text: 'Privacy Policy' },
    { href: '/', text: 'Terms of Service' },
    { href: '/', text: 'Cookie Policy' },
  ]
  const socialLinks = ['Twitter', 'Github', 'Linkedin', 'Mail']
  const categoryLinks = {
    title: 'Categories',
    categories: [
      { title: 'Technology', href: '/' },
      { title: 'Lifestyle', href: '/' },
      { title: 'Business', href: '/' },
      { title: 'Design', href: '/' },
    ]
  }
  const companyLinks = {
    title: 'Company',
    categories: [
      { title: 'About us', href: '/' },
      { title: 'Contact', href: '/' },
    ]
  }

  const onSubmit = (e: any) => {
    e.preventDefault();
  }

  return (
    <footer className="w-full bg-[rgb(17,24,39)] px-3 lg:px-10 py-10 lg:py-14">
      <div className="w-full max-w-[1536px] mx-auto justify-center items-center flex flex-col gap-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <h4 className="text-2xl font-serif font-bold text-background">
              {'Drafts'}
            </h4>

            <p className="text-background !leading-relaxed">
              {'Empowering minds through exceptional storytelling and thought-provoking content. Join our community of readers and writers.'}
            </p>

            <div className="flex flex-row gap-8">
              {socialLinks.map((link: any, index) => (
                <Icon key={index} name={link} className="text-background" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-lg font-serif font-bold text-background">
              {categoryLinks.title}
            </h5>

            <div className="flex flex-col gap-2">
              {categoryLinks.categories.map((cat, index) => (
                <Link key={index} href={cat.href} className="text-background hover:text-primary transition-colors">
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-lg font-serif font-bold text-background">
              {companyLinks.title}
            </h5>

            <div className="flex flex-col gap-2">
              {companyLinks.categories.map((cat, index) => (
                <Link key={index} href={cat.href} className="text-background hover:text-primary transition-colors">
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-lg font-serif font-bold text-background">
              {'Stay Updated'}
            </h5>

            <p className="text-primary-foreground/80 text-sm text-background">
              {'Get the latest articles delivered straight to your inbox.'}
            </p>

            <div className="flex flex-col gap-3">
              <Input
                isRequired
                radius="sm"
                type="email"
                name="email"
                variant="bordered"
                placeholder="Enter your email"
                classNames={{
                  input: 'text-background',
                  base: 'data-[focus-within=true]:border-background data-[focus-within=true]:ring-1 data-[focus-within=true]:rounded-lg data-[focus-within=true]:ring-background',
                  inputWrapper: 'px-3 py-2 flex caret-background h-10 border text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-primary-foreground/10 border-primary-foreground/20 text-primary-background placeholder:text-primary-background/60'
                }}
                errorMessage="Please enter a valid email"
              />

              <Button variant="solid" radius="sm">
                {'Subscribe now'}
              </Button>
            </div>
          </div>
        </div>

        <Divider className="bg-background" />

        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            {'© 2025 Drafts. All rights reserved.'}
          </p>

          <div className="flex gap-6 text-sm text-primary-foreground/60">
            {complianceLinks.map((link, index) => (
              <Link key={index} href={link.href} className="hover:text-primary transition-colors">
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer