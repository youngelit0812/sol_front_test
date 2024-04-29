import { useState, useCallback } from 'react'
import LazyLoad from 'react-lazyload'
import { useGetMintDecimals, util } from '@sentre/senhub'

import { Row, Col, Typography, Divider } from 'antd'
import Search from './search'
import Mint from './mint'
import { LiteMintInfo } from '../preview'

import { usePool } from 'hooks/usePool'

const LIMITATION = 100

export type SelectionInfo = {
  mintInfo?: LiteMintInfo
  poolAddresses: string[]
}

const MintSelection = ({
  value,
  onChange,
}: {
  value: SelectionInfo
  onChange: (value: SelectionInfo) => void
}) => {
  const [mintAddresses, setMintAddresses] = useState<string[]>([])
  const { address: currentMintAddress } = value.mintInfo || {}
  const { pools } = usePool()
  const getDecimals = useGetMintDecimals()

  // Compute available pools
  const getAvailablePoolAddresses = useCallback(
    (mintAddress: string) => {
      if (!util.isAddress(mintAddress)) return []
      return Object.keys(pools).filter((poolAddress) => {
        const { mint_a, mint_b } = pools[poolAddress]
        return [mint_a, mint_b].includes(mintAddress)
      })
    },
    [pools],
  )

  // Return data to parent
  const onMint = useCallback(
    async (mintAddress: string) => {
      const poolAddresses = getAvailablePoolAddresses(mintAddress)
      const decimals = (await getDecimals({ mintAddress })) || 0
      return onChange({
        mintInfo: {
          address: mintAddress,
          decimals,
        },
        poolAddresses,
      })
    },
    [getAvailablePoolAddresses, onChange, getDecimals],
  )

  const renderMintAddressObjs = () => {
    return mintAddresses.slice(0, LIMITATION).map((mintAddress, i) => (
      <Col span={24} key={i}>
        {/* <LazyLoad height={48} overflow> */}
          <Mint
            mintAddress={mintAddress}
            onClick={() => onMint(mintAddress)}
            active={currentMintAddress === mintAddress}
          />
        {/* </LazyLoad> */}
      </Col>
    ));
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Typography.Title level={5}>Token Selection</Typography.Title>
      </Col>
      <Col span={24}>
        <Divider style={{ margin: 0 }} />
      </Col>
      <Col span={24}>
        <Search onChange={setMintAddresses} />
      </Col>
      <Col span={24}>
        <Row gutter={[16, 16]} style={{ height: 300 }} className="scrollbar">
          <Col span={24}>
            <Row gutter={[16, 16]}>
              renderMintAddressObjs();              
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default MintSelection
