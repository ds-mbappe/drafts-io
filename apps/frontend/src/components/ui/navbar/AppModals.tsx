import ModalSearch from '../../pannels/ModalSearch';

export const AppModals = ({
  isOpenSearch,
  onOpenChangeSearch,
}: {
  isOpenSearch: boolean;
  onOpenChangeSearch: () => void;
}) => (
  <ModalSearch
    isOpenSearch={isOpenSearch}
    onOpenChangeSearch={onOpenChangeSearch}
  />
);
